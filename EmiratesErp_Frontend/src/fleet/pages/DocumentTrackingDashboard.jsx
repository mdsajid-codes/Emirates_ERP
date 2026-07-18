import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { ShieldCheck, AlertCircle, Clock, Search, Filter, Car, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../tripManagement/components/table/DataTable';

const DocumentTrackingDashboard = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination & Debouncing states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchDocumentTrackingData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/fleet/compliance/expiring-documents`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: { status: statusFilter }
      });
      setDocuments(response.data || []);
    } catch (error) {
      console.error("Error fetching document tracking data:", error);
    } finally {
      setLoading(false);
    }
  }, [API_URL, statusFilter]);

  useEffect(() => {
    fetchDocumentTrackingData();
  }, [fetchDocumentTrackingData]);

  // Reset page when filter or search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const filteredDocs = documents.filter(doc => 
    doc.entityName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    doc.documentType?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  // Pagination slicing
  const totalRecords = filteredDocs.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const startIndex = (page - 1) * pageSize;
  const pagedDocs = filteredDocs.slice(startIndex, startIndex + pageSize);

  const stats = {
    total: documents.length,
    expired: documents.filter(d => d.status === 'EXPIRED').length,
    expiringSoon: documents.filter(d => d.status === 'EXPIRING_SOON').length,
    valid: documents.filter(d => d.status === 'VALID').length
  };

  const columns = [
    { 
      key: "documentType", 
      header: "Document",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-theme ${row.entityType === 'VEHICLE' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
            {row.entityType === 'VEHICLE' ? <Car size={14} /> : <User size={14} />}
          </div>
          <span className="font-bold text-gray-800 uppercase text-[11px]">{row.documentType.replace('_', ' ')}</span>
        </div>
      )
    },
    { key: "entityName", header: "Entity Name" },
    { key: "expiryDate", header: "Expiry Date" },
    { 
      key: "daysUntilExpiry", 
      header: "Days Left",
      render: (row) => (
        <span className={`font-black ${row.daysUntilExpiry < 0 ? 'text-red-600' : row.daysUntilExpiry <= 30 ? 'text-orange-500' : 'text-green-600'}`}>
          {row.daysUntilExpiry}d
        </span>
      )
    },
    { 
      key: "status", 
      header: "Status",
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
          row.status === 'EXPIRED' ? 'bg-red-100 text-red-700' : 
          row.status === 'EXPIRING_SOON' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
        }`}>
          {row.status.replace('_', ' ')}
        </span>
      )
    },
    {
      key: "actions",
      header: "Action",
      render: (row) => (
        <button 
          onClick={() => navigate(row.entityType === 'VEHICLE' ? `/fleet-dashboard/vehicle-details/${row.entityId}` : `/fleet-dashboard/driver-details/${row.entityId}`)}
          className="p-1.5 hover:bg-muted rounded-theme text-primary transition-colors flex items-center gap-1 text-[10px] font-bold"
        >
          View <ArrowRight size={12} />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <ShieldCheck className="text-primary" size={32} />
            Document Tracking
          </h1>
          <p className="text-gray-500 mt-1">Unified document tracker for fleet vehicles and drivers</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-white px-3 py-1.5 rounded-full border border-border">
          <Clock size={14} /> Last scan: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-theme border border-border shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Documents</p>
          <p className="text-2xl font-black text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-red-50 p-5 rounded-theme border border-red-100 shadow-sm">
          <p className="text-[10px] font-bold text-red-400 uppercase mb-1">Expired</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-black text-red-600">{stats.expired}</p>
            <AlertCircle className="text-red-400" size={24} />
          </div>
        </div>
        <div className="bg-orange-50 p-5 rounded-theme border border-orange-100 shadow-sm">
          <p className="text-[10px] font-bold text-orange-400 uppercase mb-1">Expiring Soon</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-black text-orange-600">{stats.expiringSoon}</p>
            <Clock className="text-orange-400" size={24} />
          </div>
        </div>
        <div className="bg-green-50 p-5 rounded-theme border border-green-100 shadow-sm">
          <p className="text-[10px] font-bold text-green-400 uppercase mb-1">Valid</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-black text-green-600">{stats.valid}</p>
            <ShieldCheck className="text-green-400" size={24} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-theme border border-border shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by plate, name or document type..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-border rounded-theme px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
          >
            <option value="">All Statuses</option>
            <option value="EXPIRED">Expired</option>
            <option value="EXPIRING_SOON">Expiring Soon</option>
            <option value="VALID">Valid</option>
          </select>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={pagedDocs} 
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalRecords={totalRecords}
        pageSize={pageSize}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
      />
    </div>
  );
};

export default DocumentTrackingDashboard;
