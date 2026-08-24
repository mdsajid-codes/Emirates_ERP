import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  X, 
  FileText, 
  Download, 
  Eye, 
  Edit2, 
  Trash2, 
  CircleDollarSign, 
  CheckCircle, 
  Clock,
  LayoutGrid,
  List,
  Columns
} from "lucide-react";
import axios from "axios";
import { toast } from 'react-toastify';
import { useLanguage } from '../../../../context/LanguageContext';

const Invoices = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  
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
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/fleet/trip-customers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCustomers(response.data || []);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page - 1,
        size: pageSize,
      });

      if (status) params.append("status", status);
      if (customerId) params.append("customerId", customerId);
      if (debouncedSearch) params.append("search", debouncedSearch);

      const response = await axios.get(`${API_URL}/fleet/trip-invoices?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setInvoices(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalRecords(response.data.totalElements || 0);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [API_URL, page, pageSize, status, customerId, debouncedSearch]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

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
      toast.error("Error downloading PDF");
    }
  };

  const getStatusColor = (st) => {
    switch (st) {
      case 'PAID': return 'bg-[#E3F8EE] text-[#01A958] border-[#A3EBC7]';
      case 'CANCELLED': return 'bg-rose-50 text-rose-600 border-rose-200';
      default: return 'bg-sky-50 text-[var(--color-primary,#0178BC)] border-sky-200';
    }
  };

  const totalInvoicedSum = invoices.reduce((acc, curr) => acc + (curr.grandTotal || 0), 0);

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-6" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center justify-center text-[var(--color-primary,#0178BC)]">
            <FileText className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#0F172A)] tracking-tight leading-tight">
              {t('fleet.invoices.title') || 'Invoices Management'}
            </h1>
            <p className="text-xs text-[var(--color-foreground-muted,#656873)] mt-0.5">
              {t('fleet.invoices.subtitle') || 'Manage and monitor customer billing and payment statuses'}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/fleet-dashboard/invoices/invoice-form')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#00A9A8] text-white text-xs font-semibold hover:opacity-90 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t('fleet.invoices.createInvoice') || 'Create Invoice'}</span>
        </button>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Total Invoices */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-sky-50 text-[var(--color-primary,#0178BC)] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.invoices.totalInvoices') || 'Total Invoices'}</p>
            <p className="text-xl font-extrabold text-[var(--color-foreground,#0F172A)] leading-none my-0.5">{totalRecords}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#656873)] truncate">Tax Invoices</p>
          </div>
        </div>

        {/* Paid Invoices */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.invoices.paidInvoices') || 'Paid Invoices'}</p>
            <p className="text-xl font-extrabold text-emerald-600 leading-none my-0.5">{invoices.filter(i => i.status === 'PAID').length}</p>
            <p className="text-[10px] text-emerald-600 font-semibold truncate">Settled Accounts</p>
          </div>
        </div>

        {/* Pending / Due */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.invoices.pendingDue') || 'Pending / Due'}</p>
            <p className="text-xl font-extrabold text-amber-600 leading-none my-0.5">{invoices.filter(i => i.status !== 'PAID' && i.status !== 'CANCELLED').length}</p>
            <p className="text-[10px] text-amber-600 font-semibold truncate">Outstanding Bills</p>
          </div>
        </div>

        {/* Total Invoiced (AED) */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <CircleDollarSign className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-foreground,#0F172A)] truncate">{t('fleet.invoices.totalInvoiced') || 'Total Invoiced (AED)'}</p>
            <p className="text-xl font-extrabold text-purple-600 leading-none my-0.5 font-mono">{totalInvoicedSum.toFixed(2)} AED</p>
            <p className="text-[10px] text-purple-600 font-semibold truncate">Filtered Grand Total</p>
          </div>
        </div>

      </div>

      {/* Main Table Section Card */}
      <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D9DADD)] shadow-xs overflow-hidden">
        
        {/* Table Controls Top Bar */}
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[var(--color-border,#D9DADD)]">
          
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-foreground-muted,#656873)] w-4 h-4" />
              <input
                type="text"
                placeholder={t('fleet.invoices.searchPlaceholder') || "Search by invoice # or customer..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] rounded-xl text-xs text-[var(--color-foreground,#0F172A)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
              />
            </div>

            {/* Customer Filter */}
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="px-3 py-2 border border-[var(--color-border,#D9DADD)] rounded-xl text-xs font-semibold text-[var(--color-foreground,#0F172A)] bg-[var(--color-card,#ffffff)] outline-none cursor-pointer"
            >
              <option value="">All Customers</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 border border-[var(--color-border,#D9DADD)] rounded-xl text-xs font-semibold text-[var(--color-foreground,#0F172A)] bg-[var(--color-card,#ffffff)] outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="GENERATED">GENERATED</option>
              <option value="PAID">PAID</option>
              <option value="PARTIAL">PARTIAL</option>
              <option value="CANCELLED">CANCELLED</option>
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
              {isRTL ? 'جاري تحميل الفواتير...' : 'Loading invoices...'}
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--color-foreground-muted,#656873)]">
              {isRTL ? 'لا توجد فواتير متاحة' : 'No invoices found'}
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead className="bg-slate-50 border-b border-[var(--color-border,#D9DADD)]">
                <tr>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">INVOICE NO</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">CUSTOMER</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">DATE</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">DUE DATE</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">TOTAL (AED)</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)]">STATUS</th>
                  <th className="p-3.5 text-xs font-bold text-[var(--color-foreground,#0F172A)] text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border,#D9DADD)] text-xs text-[var(--color-foreground,#0F172A)]">
                {invoices.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td 
                      onClick={() => navigate(`/fleet-dashboard/invoices/invoice-details/${row.id}`)}
                      className="p-3.5 cursor-pointer font-bold text-[var(--color-primary,#0178BC)] hover:underline font-mono"
                    >
                      {row.invoiceNumber}
                    </td>

                    <td className="p-3.5 font-bold text-[var(--color-foreground,#0F172A)]">{row.customerName}</td>

                    <td className="p-3.5 font-semibold text-[var(--color-foreground-muted,#656873)]">{row.invoiceDate}</td>

                    <td className="p-3.5 font-semibold font-mono">
                      <span className={row.isOverdue && row.status !== 'PAID' ? "text-rose-600 font-bold" : "text-[var(--color-foreground-muted,#656873)]"}>
                        {row.dueDate || '–'}
                      </span>
                    </td>

                    <td className="p-3.5 font-bold font-mono text-emerald-600">{row.grandTotal} AED</td>

                    <td className="p-3.5">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(row.status)}`}>
                          {row.status || 'GENERATED'}
                        </span>
                        {row.isOverdue && row.status !== 'PAID' && row.status !== 'CANCELLED' && (
                          <span className="text-[9px] font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded uppercase animate-pulse">
                            Overdue
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => navigate(`/fleet-dashboard/invoices/invoice-details/${row.id}`)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[var(--color-primary,#0178BC)] hover:bg-blue-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 stroke-[1.8]" />
                        </button>

                        <button
                          onClick={() => handleDownloadPdf(row)}
                          className="w-8 h-8 rounded-lg bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D9DADD)] text-[var(--color-primary,#0178BC)] hover:bg-blue-50 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4 stroke-[1.8]" />
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
            Showing page <span className="font-bold text-[var(--color-foreground,#0F172A)]">{page}</span> of <span className="font-bold text-[var(--color-foreground,#0F172A)]">{totalPages || 1}</span> ({totalRecords} records)
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
};

export default Invoices;