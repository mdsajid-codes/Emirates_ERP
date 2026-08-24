import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Fuel,
  Plus,
  Filter,
  Search,
  Edit2,
  Trash2,
  Calendar,
  FileText,
  Navigation,
  Download,
  Eye,
  CircleDollarSign,
  Droplet,
  TrendingUp,
  Truck,
  User,
  LayoutGrid,
  List,
  Columns
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';

export default function FuelLog() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [vehicles, setVehicles] = useState([]);

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

  const fetchEntries = async (p = page, s = size, searchVal = debouncedSearch, vehicleId = vehicleFilter) => {
    try {
      setLoading(true);
      const params = {
        page: p - 1, // backend is 0-indexed
        size: s,
        search: searchVal || undefined,
        vehicleId: vehicleId || undefined
      };
      
      const response = await axios.get(`${API_URL}/fleet/fuel`, {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setEntries(response.data.content || []);
      setTotalElements(response.data.totalElements || 0);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error('Error fetching fuel entries:', error);
      toast.error('Failed to load fuel entries');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API_URL}/fleet/vehicles/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setVehicles(response.data.content || response.data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fuel entry?')) return;
    try {
      await axios.delete(`${API_URL}/fleet/fuel/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      toast.success('Entry deleted');
      fetchEntries(page, size);
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  useEffect(() => {
    setPage(1);
    fetchEntries(1, size, debouncedSearch, vehicleFilter);
  }, [debouncedSearch, vehicleFilter]);

  useEffect(() => {
    fetchEntries(page, size, debouncedSearch, vehicleFilter);
  }, [page, size]);

  const totalQuantitySum = entries.reduce((acc, curr) => acc + (curr.quantityLiters || 0), 0);
  const totalSpendSum = entries.reduce((acc, curr) => acc + (curr.amountAed || 0), 0);
  const avgPricePerLiter = totalQuantitySum > 0 ? (totalSpendSum / totalQuantitySum).toFixed(2) : '0.00';

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-6" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center justify-center text-[var(--color-primary,#0178BC)]">
            <Fuel className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#0F172A)] tracking-tight leading-tight">
              {t('fleet.fuel.title') || 'Fuel Management'}
            </h1>
            <p className="text-xs text-[var(--color-foreground-muted,#656873)] mt-0.5">
              {t('fleet.fuel.subtitle') || 'Track fuel consumption, costs, and efficiency across the fleet'}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/fleet-dashboard/fuel/fuel-form')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#00A9A8] text-white text-xs font-semibold hover:opacity-90 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t('fleet.fuel.newEntry') || 'New Fuel Entry'}</span>
        </button>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Total Fuel Logs */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-sky-50 text-[var(--color-primary,#0178BC)] flex items-center justify-center shrink-0">
            <Fuel className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.fuel.totalLogs') || 'Total Fuel Logs'}</p>
            <p className="text-xl font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5">{totalElements}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#656873)] truncate">Refueling Records</p>
          </div>
        </div>

        {/* Total Quantity (Liters) */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Droplet className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.fuel.totalQuantity') || 'Total Quantity (L)'}</p>
            <p className="text-xl font-extrabold text-amber-600 leading-none my-0.5 font-mono">{totalQuantitySum.toFixed(1)} L</p>
            <p className="text-[10px] text-amber-600 font-semibold truncate">Page Volume Sum</p>
          </div>
        </div>

        {/* Total Spend (AED) */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <CircleDollarSign className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.fuel.totalSpend') || 'Total Spend (AED)'}</p>
            <p className="text-xl font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5 font-mono">{totalSpendSum.toFixed(2)} AED</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#656873)] truncate">Page Total Cost</p>
          </div>
        </div>

        {/* Avg Price / Liter */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.fuel.avgPrice') || 'Avg Price / Liter'}</p>
            <p className="text-xl font-extrabold text-emerald-600 leading-none my-0.5 font-mono">{avgPricePerLiter} AED/L</p>
            <p className="text-[10px] text-emerald-600 font-semibold truncate">Calculated Rate</p>
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
                placeholder={t('fleet.fuel.searchPlaceholder') || "Search by fuel station or notes..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] rounded-xl text-xs text-[var(--color-foreground,#0F172A)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
              />
            </div>

            {/* Vehicle Filter */}
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="px-3 py-2 border border-[var(--color-border,#D9DADD)] rounded-xl text-xs font-semibold text-[var(--color-foreground,#0F172A)] bg-[var(--color-card,#ffffff)] outline-none cursor-pointer"
            >
              <option value="">{t('fleet.vehicles.allVehicles') || 'All Vehicles'}</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.plateNumber}</option>
              ))}
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
              {isRTL ? 'جاري تحميل سجلات الوقود...' : 'Loading fuel entries...'}
            </div>
          ) : entries.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--color-foreground-muted,#656873)]">
              {isRTL ? 'لا توجد سجلات وقود متاحة' : 'No fuel logs found'}
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead className="bg-slate-50 border-b border-[var(--color-border,#D9DADD)]">
                <tr>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">VEHICLE</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">DRIVER</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">DATE</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">TYPE / STATION</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">QUANTITY</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">COST (AED)</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">ODOMETER</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)] text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border,#D9DADD)] text-xs text-[var(--color-foreground,#0F172A)]">
                {entries.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td 
                      onClick={() => navigate(`/fleet-dashboard/fuel/fuel-details/${row.id}`)}
                      className="p-3.5 cursor-pointer font-bold text-[var(--color-primary,#0178BC)] hover:underline font-mono"
                    >
                      <span className="flex items-center gap-1.5">
                        <Truck size={13} className="text-[var(--color-primary,#0178BC)]" />
                        {row.vehiclePlateNumber || row.vehicle?.plateNumber || 'N/A'}
                      </span>
                    </td>

                    <td className="p-3.5 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <User size={13} className="text-slate-400" />
                        {row.driverName || row.driver?.name || 'Unassigned'}
                      </span>
                    </td>

                    <td className="p-3.5 font-semibold text-[var(--color-foreground-muted,#656873)]">{row.fuelDate}</td>

                    <td className="p-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-[var(--color-foreground,#0F172A)]">{row.fuelType || 'DIESEL'}</span>
                        <span className="text-[10px] text-[var(--color-foreground-muted,#656873)]">{row.fuelStation || 'ADNOC Station'}</span>
                      </div>
                    </td>

                    <td className="p-3.5 font-bold font-mono text-amber-700">{row.quantityLiters} L</td>

                    <td className="p-3.5 font-bold font-mono text-emerald-600">{row.amountAed} AED</td>

                    <td className="p-3.5 font-bold font-mono text-slate-600">{row.odometerReading ? `${row.odometerReading} KM` : '–'}</td>

                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => navigate(`/fleet-dashboard/fuel/fuel-details/${row.id}`)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[var(--color-primary,#0178BC)] hover:bg-blue-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 stroke-[1.8]" />
                        </button>

                        <button
                          onClick={() => navigate(`/fleet-dashboard/fuel/fuel-form/${row.id}`)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[var(--color-primary,#0178BC)] hover:bg-blue-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="Edit Entry"
                        >
                          <Edit2 className="w-4 h-4 stroke-[1.8]" />
                        </button>

                        <button
                          onClick={() => handleDelete(row.id)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[#D6282F] hover:bg-rose-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="Delete Entry"
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
}
