import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, Edit, Trash2, Loader, AlertCircle, Search, FileText } from 'lucide-react';
import Pagination from '../../components/Pagination';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const SupplierTenderingPage = () => {
  const [tenderings, setTenderings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Pagination State
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchTenderings = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/purchases/supplier-tendering`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, size, sort: 'createdAt,desc' }
      });
      if (res.data.content) {
          setTenderings(res.data.content);
          setTotalPages(res.data.totalPages);
          setTotalElements(res.data.totalElements);
      } else {
          const data = res.data || [];
          setTenderings(data);
          setTotalPages(1);
          setTotalElements(data.length);
      }
    } catch (err) {
      console.error('Failed to fetch supply tenderings:', err);
      setError('Failed to fetch supply tenderings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenderings();
  }, [page, size]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this Supply Tendering?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/purchases/supplier-tendering/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchTenderings();
    } catch (err) {
      console.error('Failed to delete tendering', err);
      setError('Failed to delete supply tendering.');
    }
  };

  const filtered = tenderings.filter(item =>
    (item.tenderNumber && item.tenderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.project && item.project.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const statusClass = (s) => {
    if (!s) return 'bg-slate-100 text-slate-800';
    switch (s.toUpperCase()) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'REQUESTS_FOR_QUOTATION': return 'bg-blue-100 text-blue-800';
      case 'RFQ_RESPONSES': return 'bg-indigo-100 text-indigo-800';
      case 'COMPARISON': return 'bg-purple-100 text-purple-800';
      case 'COMPARISON_COMPLETED': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const formatStatus = (s) => {
    if (!s) return 'N/A';
    return s.replace(/_/g, ' ');
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Supply Tendering</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Tender # / Project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full sm:w-72 pr-10 bg-background-muted border-border"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
          </div>
          <Link to="/purchase-dashboard/supplier-tendering/new" className="btn-primary flex items-center gap-2">
            <PlusCircle size={18} /> New Tendering
          </Link>
        </div>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-card rounded-xl shadow-sm overflow-hidden border">
        {loading ? (
          <div className="flex justify-center items-center h-80"><Loader className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-background-muted">
                  <tr>
                    <th className="th-cell">Tender Number</th>
                    <th className="th-cell">Required Date</th>
                    <th className="th-cell">Project</th>
                    <th className="th-cell">Entity</th>
                    <th className="th-cell">Initiated By</th>
                    <th className="th-cell">Status</th>
                    <th className="th-cell">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-foreground-muted">
                  {filtered.length > 0 ? filtered.map(item => (
                    <tr key={item.id} className="border-b hover:bg-background-muted">
                      <td className="td-cell font-medium text-foreground">
                        <button
                          onClick={() => navigate(`/purchase-dashboard/supplier-tendering/view/${item.id}`)}
                          className="text-primary underline hover:text-primary/80"
                          title={`View Tendering ${item.tenderNumber}`}
                        >
                          {item.tenderNumber}
                        </button>
                      </td>
                      <td className="td-cell">{item.requiredDate ? new Date(item.requiredDate).toLocaleDateString() : '-'}</td>
                      <td className="td-cell">{item.project || '-'}</td>
                      <td className="td-cell">{item.entity || '-'}</td>
                      <td className="td-cell">{item.initiatedBy || '-'}</td>
                      <td className="td-cell">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusClass(item.status)}`}>
                          {formatStatus(item.status)}
                        </span>
                      </td>
                      <td className="td-cell">
                        <div className="flex items-center gap-1">
                          <button onClick={() => navigate(`/purchase-dashboard/supplier-tendering/edit/${item.id}`)} className="p-2 hover:text-primary hover:bg-background-muted rounded-full" title="Edit"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 hover:text-red-600 hover:bg-background-muted rounded-full" title="Delete"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="7" className="text-center py-10 text-foreground-muted"><AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" /><h3 className="mt-2 text-sm font-medium">No tenderings found</h3><p className="mt-1 text-sm">Create a new tendering to get started.</p></td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination 
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              pageSize={size}
              onPageSizeChange={(newSize) => { setSize(newSize); setPage(0); }}
              totalElements={totalElements}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SupplierTenderingPage;
