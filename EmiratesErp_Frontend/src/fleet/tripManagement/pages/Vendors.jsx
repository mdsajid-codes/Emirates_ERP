import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Eye, 
  Store, 
  CheckCircle2, 
  FileText, 
  TrendingUp, 
  ShieldCheck,
  Download,
  LayoutGrid,
  List,
  Columns,
  Wrench
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLanguage } from '../../../context/LanguageContext';

const Vendors = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [vendors, setVendors] = useState([]);
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
    totalCorporate: pagination.totalElements || vendors.length || 0,
    activePartners: vendors.filter(v => v.status === 'ACTIVE' || v.isActive).length,
    maintenanceFuel: vendors.filter(v => v.serviceCategory === 'VEHICLE_REPAIR' || v.serviceCategory === 'FUEL_SUPPLIER').length,
    totalExpenses: vendors.reduce((acc, v) => acc + (Number(v.totalExpenses) || Number(v.totalSpend) || 0), 0),
    approvedAccounts: vendors.filter(v => v.status === 'ACTIVE').length
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API_URL}/fleet/vendors/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      const allVendors = response.data || [];
      if (allVendors.length === 0) {
        toast.info("No vendor records to export");
        return;
      }

      const headers = ["Company Name", "Contact Person", "Email", "Phone", "TRN Number", "Service Category", "Status"];
      const csvRows = [];
      csvRows.push(headers.join(","));

      allVendors.forEach(v => {
        const row = [
          `"${(v.companyName || v.name || '').replace(/"/g, '""')}"`,
          `"${(v.contactPersonName || v.contactPerson || '').replace(/"/g, '""')}"`,
          `"${(v.email || '').replace(/"/g, '""')}"`,
          `"${(v.phone || '').replace(/"/g, '""')}"`,
          `"${(v.trnNumber || '').replace(/"/g, '""')}"`,
          `"${(v.serviceCategory || 'Vehicle Repair').replace(/"/g, '""')}"`,
          `"${(v.status || 'ACTIVE').replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(","));
      });

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "Vendors_Directory_Report.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Vendors exported successfully");
    } catch (error) {
      console.error("Error exporting vendors:", error);
      toast.error("Failed to export vendors");
    }
  };

  const fetchVendors = async (page = 0, size = 10, searchVal = debouncedSearch) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setVendors([]);
        setLoading(false);
        return;
      }

      let response;
      try {
        response = await axios.get(`${API_URL}/fleet/vendors`, {
          params: { page, size, search: searchVal || undefined, status: statusFilter || undefined },
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        // Fallback to trip-vendors endpoint if fleet/vendors throws 500
        response = await axios.get(`${API_URL}/fleet/trip-vendors`, {
          params: { page, size, search: searchVal || undefined },
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null);
      }

      if (response && response.data && response.data.content) {
        setVendors(response.data.content);
        setPagination({
          page: response.data.number || 0,
          size: response.data.size || 10,
          totalElements: response.data.totalElements || response.data.content.length
        });
      } else if (response && Array.isArray(response.data)) {
        setVendors(response.data);
        setPagination({ page: 0, size: 10, totalElements: response.data.length });
      } else {
        setVendors([]);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors(0, pagination.size, debouncedSearch);
  }, [statusFilter, debouncedSearch]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;
    try {
      await axios.delete(`${API_URL}/fleet/vendors/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Vendor deleted successfully");
      fetchVendors(pagination.page, pagination.size);
    } catch (error) {
      console.error("Error deleting vendor:", error);
      toast.error("Failed to delete vendor");
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(vendors.map(v => v.id));
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
      case 'INACTIVE':
        return (
          <span className="px-2.5 py-1 rounded-md font-semibold text-xs bg-[#FFF4E5] text-[#FF9800] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9800]"></span>
            {isRTL ? 'غير نشط' : 'INACTIVE'}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-md font-semibold text-xs bg-slate-100 text-slate-700 inline-flex items-center gap-1.5">
            {status || (isRTL ? 'نشط' : 'ACTIVE')}
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-6" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center justify-center text-purple-600">
            <Store className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#0F172A)] tracking-tight leading-tight">
              {t('fleet.vendors.title') || 'Our Vendors'}
            </h1>
            <p className="text-xs text-[var(--color-foreground-muted,#656873)] mt-0.5">
              {t('fleet.vendors.subtitle') || 'Manage corporate partners and service vendors in the GCC network'}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/fleet-dashboard/vendors/vendor-form')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary,#2563EB)] text-white text-xs font-semibold hover:opacity-90 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t('fleet.vendors.createVendor') || 'Create New Vendor'}</span>
        </button>
      </div>

      {/* 5 KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        
        {/* Total Corporate Vendors */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Store className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.vendors.totalCorporate') || 'Total Vendors'}</p>
            <p className="text-xl font-extrabold text-purple-600 leading-none my-0.5">{stats.totalCorporate}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#656873)] truncate">{t('fleet.vendors.allPartners') || 'GCC Service Partners'}</p>
          </div>
        </div>

        {/* Active Partners */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.vendors.activePartners') || 'Active Suppliers'}</p>
            <p className="text-xl font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5">{stats.activePartners}</p>
            <p className="text-[10px] font-semibold text-emerald-600 truncate">Approved Accounts</p>
          </div>
        </div>

        {/* Maintenance & Fuel */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.vendors.maintenanceFuel') || 'Maintenance & Fuel'}</p>
            <p className="text-xl font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5">{stats.maintenanceFuel}</p>
            <p className="text-[10px] text-amber-600 font-semibold truncate">Workshop Suppliers</p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-[var(--color-primary,#2563EB)] flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.vendors.totalExpenses') || 'Total Expenses'}</p>
            <p className="text-base font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5 truncate">AED {stats.totalExpenses.toLocaleString()}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#656873)] truncate">{t('fleet.vendors.ytdExpenses') || 'YTD Transport Expenses'}</p>
          </div>
        </div>

        {/* Approved Accounts */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-teal-50 text-[#00A9A8] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.vendors.approvedAccounts') || 'Approved Accounts'}</p>
            <p className="text-xl font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5">{stats.approvedAccounts}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#656873)] truncate">Verified Suppliers</p>
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
                placeholder={t('fleet.vendors.searchPlaceholder') || "Search by vendor name, contact, email or phone..."}
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
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
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
              {isRTL ? 'جاري تحميل قائمة الموردين...' : 'Loading vendors directory...'}
            </div>
          ) : vendors.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--color-foreground-muted,#656873)]">
              {isRTL ? 'لا يوجد موردون متاحون حالياً.' : 'No vendors found in database.'}
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-slate-50 border-b border-[var(--color-border,#D9DADD)]">
                <tr>
                  <th className="p-3.5 w-12 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedRows.length === vendors.length && vendors.length > 0}
                      className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary,#2563EB)] focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.customers.companyName') || 'COMPANY NAME'}</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.customers.contactPerson') || 'CONTACT PERSON'}</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.customers.emailAddress') || 'EMAIL ADDRESS'}</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.customers.phone') || 'PHONE'}</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.vendorForm.serviceCategory') || 'SERVICE CATEGORY'}</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.customers.status') || 'STATUS'}</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)] text-center">{t('fleet.customers.actions') || 'ACTIONS'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border,#D9DADD)] text-xs text-[var(--color-foreground,#0F172A)]">
                {vendors.map((v) => (
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
                      onClick={() => navigate(`/fleet-dashboard/vendor-details/${v.id}`)}
                      className="p-3.5 font-bold text-[var(--color-primary,#2563EB)] cursor-pointer hover:underline"
                    >
                      {v.companyName || v.name}
                    </td>
                    <td className="p-3.5 font-medium">{v.contactPersonName || v.contactPerson || '–'}</td>
                    <td className="p-3.5 text-[var(--color-foreground-muted,#656873)]">{v.email || '–'}</td>
                    <td className="p-3.5 font-medium">{v.phone || '–'}</td>
                    <td className="p-3.5 font-semibold text-purple-600 uppercase">{v.serviceCategory || 'Vehicle Repair'}</td>
                    <td className="p-3.5">
                      {getStatusBadge(v.status)}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => navigate(`/fleet-dashboard/vendor-details/${v.id}`)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[var(--color-primary,#2563EB)] hover:bg-blue-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="View Vendor"
                        >
                          <Eye className="w-4 h-4 stroke-[1.8]" />
                        </button>
                        <button
                          onClick={() => navigate(`/fleet-dashboard/vendors/vendor-form/${v.id}`)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[var(--color-primary,#2563EB)] hover:bg-blue-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="Edit Vendor"
                        >
                          <Edit className="w-4 h-4 stroke-[1.8]" />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[#D6282F] hover:bg-rose-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="Delete Vendor"
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
            {t('fleet.vehicles.showing') || 'Showing'} {vendors.length > 0 ? (pagination.page * pagination.size) + 1 : 0} {t('fleet.vehicles.of') || 'of'} {pagination.totalElements || vendors.length} {t('fleet.vehicles.records') || 'records'}
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              disabled={pagination.page === 0}
              onClick={() => fetchVendors(pagination.page - 1, pagination.size)}
              className="px-2.5 py-1.5 border border-[var(--color-border,#D9DADD)] rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              &lt;
            </button>
            <button className="px-3 py-1.5 bg-[var(--color-primary,#2563EB)] text-white font-bold rounded-lg cursor-pointer">
              {pagination.page + 1}
            </button>
            <button 
              disabled={(pagination.page + 1) * pagination.size >= pagination.totalElements}
              onClick={() => fetchVendors(pagination.page + 1, pagination.size)}
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

export default Vendors;