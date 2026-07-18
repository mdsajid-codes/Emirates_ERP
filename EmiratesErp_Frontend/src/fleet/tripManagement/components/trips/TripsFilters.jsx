import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const TripsFilters = ({ drivers = [], customers = [], onFilter }) => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const [filters, setFilters] = useState({
    search: "",
    month: "",
    status: "",
    customerId: "",
    driverId: "",
    fromDate: "",
    toDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    onFilter(filters);
  };

  return (
    <div className="bg-card rounded-theme shadow-sm border border-border p-6 mb-8 animate-slide-down">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        
        {/* 📌 STATUS */}
        <div>
          <label className="text-[10px] font-black text-foreground-muted uppercase tracking-widest px-1">Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="w-full mt-1.5 px-3 py-2 rounded-theme border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          >
            <option value="">All Status</option>
            <option value="CREATED">Created</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="INVOICED">Invoiced</option>
            <option value="PAID">Paid</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {/* 👤 CUSTOMER */}
        <div>
          <label className="text-[10px] font-black text-foreground-muted uppercase tracking-widest px-1">Customer</label>
          <select
            name="customerId"
            value={filters.customerId}
            onChange={handleChange}
            className="w-full mt-1.5 px-3 py-2 rounded-theme border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          >
            <option value="">All Customers</option>
            {customers.map((cust) => (
              <option key={cust.id} value={cust.id}>{cust.companyName}</option>
            ))}
          </select>
        </div>

        {/* 👤 DRIVER */}
        <div>
          <label className="text-[10px] font-black text-foreground-muted uppercase tracking-widest px-1">Driver</label>
          <select
            name="driverId"
            value={filters.driverId}
            onChange={handleChange}
            className="w-full mt-1.5 px-3 py-2 rounded-theme border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          >
            <option value="">All Drivers</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>{driver.name}</option>
            ))}
          </select>
        </div>

        {/* 📅 FROM DATE */}
        <div>
          <label className="text-[10px] font-black text-foreground-muted uppercase tracking-widest px-1">From Date</label>
          <input
            type="date"
            name="fromDate"
            value={filters.fromDate}
            onChange={handleChange}
            className="w-full mt-1.5 px-3 py-2 rounded-theme border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        {/* 📅 TO DATE */}
        <div>
          <label className="text-[10px] font-black text-foreground-muted uppercase tracking-widest px-1">To Date</label>
          <input
            type="date"
            name="toDate"
            value={filters.toDate}
            onChange={handleChange}
            className="w-full mt-1.5 px-3 py-2 rounded-theme border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        {/* Apply Button */}
        <div className="flex items-end">
            <button
              onClick={applyFilters}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-theme text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-md shadow-primary/20 active:scale-95"
            >
              Filter
            </button>
        </div>
      </div>

    </div>
  );
};

export default TripsFilters;