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
  Download
} from 'lucide-react';
import { toast } from 'react-toastify';
import FuelEntryForm from './FuelEntryForm';

export default function FuelLog() {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

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
      const response = await axios.get(`${API_URL}/fleet/vehicles`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setVehicles(response.data.content || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      await axios.delete(`${API_URL}/fleet/fuel/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      toast.success('Entry deleted');
      fetchEntries();
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

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <>
      <div className="p-6 space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fuel Management</h1>
            <p className="text-sm text-foreground-muted">Track fuel consumption, costs, and efficiency across the fleet</p>
          </div>
          <button
            onClick={() => {
              setSelectedEntry(null);
              setIsFormOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-theme font-medium hover:opacity-90 transition-all shadow-md shadow-primary/20"
          >
            <Plus size={18} />
            New Fuel Entry
          </button>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-theme p-4 flex flex-wrap items-center gap-4 shadow-sm">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" size={18} />
            <input
              type="text"
              placeholder="Search by fuel station or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-theme text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all text-foreground"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-foreground-muted" />
            <select
              className="bg-background border border-border rounded-theme px-3 py-2 text-sm focus:outline-none text-foreground"
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
            >
              <option value="">All Vehicles</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.plateNumber}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-theme shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Driver</th>
                  <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Type / Station</th>
                  <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider text-right">Quantity</th>
                  <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider text-right">Cost</th>
                  <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider text-right">Odometer</th>
                  <th className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-foreground-muted">Loading logs...</p>
                      </div>
                    </td>
                  </tr>
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        <Fuel size={48} />
                        <p className="text-lg font-medium">No fuel logs found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{entry.vehiclePlateNumber}</span>
                          <span className="text-xs text-foreground-muted">{entry.vehicleMakeModel}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {entry.driverName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {entry.fuelDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{entry.fuelType}</span>
                          <span className="text-xs text-foreground-muted flex items-center gap-1">
                            <Navigation size={10} />
                            {entry.fuelStation || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-foreground">
                        {entry.quantityLiters} L
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-primary">
                        AED {entry.amountAed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-foreground-muted">
                        {entry.odometerReading?.toLocaleString()} km
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {entry.receiptPath && (
                            <button
                              onClick={() => window.open(`${API_URL}/files/${entry.receiptPath}`, '_blank')}
                              className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-theme transition-colors"
                              title="View Receipt"
                            >
                              <FileText size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedEntry(entry);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 hover:bg-primary/10 text-foreground-muted hover:text-primary rounded-theme transition-colors"
                            title="Edit Entry"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-1.5 hover:bg-red-50 text-foreground-muted hover:text-red-500 rounded-theme transition-colors"
                            title="Delete Entry"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Premium Pagination Footer */}
          <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/20">
            <div className="text-sm text-foreground-muted font-bold">
              Showing page <span className="text-foreground">{page}</span> of{' '}
              <span className="text-foreground">{totalPages || 1}</span> ({totalElements} records)
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground-muted font-bold">Rows per page:</span>
                <select
                  value={size}
                  onChange={(e) => {
                    setSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-background border border-border rounded-theme text-xs px-2 py-1 outline-none focus:ring-1 focus:ring-primary text-foreground font-semibold"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex gap-1.5">
                <button
                  disabled={page <= 1 || loading}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 bg-background border border-border hover:bg-muted text-foreground rounded-theme text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 bg-background border border-border hover:bg-muted text-foreground rounded-theme text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FuelEntryForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={fetchEntries}
        initialData={selectedEntry}
      />
    </>
  );
}
