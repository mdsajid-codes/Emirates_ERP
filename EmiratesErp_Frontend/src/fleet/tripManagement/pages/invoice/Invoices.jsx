import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { Plus, View, Filter, Search, Calendar, X } from "lucide-react";
import { FiDownload } from "react-icons/fi";
import axios from "axios";
import AppButton from "../../components/dashboard/AppButton";
import DataTable from "../../components/table/DataTable";

const Invoices = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  
  // Data State
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filter State
  const [status, setStatus] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const invoiceColumns = [
    { key: "invoiceNumber", header: "Invoice No" },
    { key: "customerName", header: "Customer" },
    { key: "invoiceDate", header: "Date" },
    { 
      key: "dueDate", 
      header: "Due Date",
      render: (row) => (
        <span className={row.isOverdue ? "text-red-500 font-bold" : ""}>
          {row.dueDate || "N/A"}
        </span>
      )
    },
    { key: "grandTotal", header: "Total (AED)" },
    { 
      key: "status", 
      header: "Status", 
      type: "chip",
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase text-center ${
            row.status === 'PAID' ? 'bg-green-100 text-green-700' : 
            row.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {row.status}
          </span>
          {row.isOverdue && row.status !== 'PAID' && row.status !== 'CANCELLED' && (
            <span className="text-[9px] font-black text-red-600 uppercase text-center bg-red-50 rounded px-1 animate-pulse">
              Overdue
            </span>
          )}
        </div>
      )
    },
    { key: "actions", header: "Actions", type: "actions", actions: [
        {
          label: <View size={18} />,
          title: "View Details",
          onClick: (row) => navigate(`${row.id}`)
        },
        {
          label: <FiDownload size={18} />,
          title: "Download PDF",
          onClick: (row) => handleDownloadPdf(row)
        }
    ]}
  ];

  const handleDownloadPdf = async (invoice) => {
    try {
      const response = await axios.get(`${API_URL}/fleet/trip-invoices/${invoice.id}/pdf`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page - 1,
        size: pageSize,
        sort: 'createdAt,desc'
      });
      if (status) params.append("status", status);
      if (customerId) params.append("customerId", customerId);
      if (startDate) params.append("start", startDate);
      if (endDate) params.append("end", endDate);

      const response = await axios.get(`${API_URL}/fleet/trip-invoices?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      setInvoices(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalRecords(response.data.totalElements || 0);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  }, [API_URL, page, pageSize, status, customerId, startDate, endDate]);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/fleet/trip-customers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCustomers(response.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [API_URL]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const resetFilters = () => {
    setStatus("");
    setCustomerId("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">   
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Invoices Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage and monitor customer billing and payment statuses
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-theme border transition-all ${showFilters ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary'}`}
          >
            <Filter size={20} />
          </button>
          <AppButton 
              icon={<Plus/>}
              className="pr-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black border-none"
              onClick={() => navigate('new')}
          >
              Create Invoice
          </AppButton>
        </div>
      </div>

      {/* Filter Bar */}
      {showFilters && (
        <div className="bg-white p-6 rounded-theme border border-border shadow-sm animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <Search size={12} /> Status
              </label>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="ISSUED">Issued</option>
                <option value="PAID">Paid</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <Search size={12} /> Customer
              </label>
              <select
                value={customerId}
                onChange={(e) => { setCustomerId(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">All Customers</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.companyName}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <Calendar size={12} /> From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
                <Calendar size={12} /> To Date
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <button 
                  onClick={resetFilters}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-theme transition-colors"
                  title="Reset Filters"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DataTable 
        columns={invoiceColumns} 
        data={invoices} 
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalRecords={totalRecords}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
      />
    </div>
  );
};

export default Invoices;