import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Plus, Eye, Edit2, Play, RefreshCw, Trash2, Calendar, FileText } from 'lucide-react';
import { journalApi } from '../../api/journalApi';
import StatusBadge from '../../components/StatusBadge';
import { toast } from 'react-toastify';

export default function JournalListPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [docType, setDocType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEntries();
  }, [statusFilter, dateFrom, dateTo, docType]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (docType) params.docType = docType;

      const res = await journalApi.getAll(params);
      setEntries(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to post this journal entry? This will lock the entry.')) return;
    try {
      await journalApi.post(id);
      toast.success('Journal entry posted successfully!');
      fetchEntries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post entry');
    }
  };

  const handleReverse = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to reverse this entry? A new reversal entry will be posted.')) return;
    try {
      await journalApi.reverse(id);
      toast.success('Reversal entry generated successfully!');
      fetchEntries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reverse entry');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this draft?')) return;
    try {
      await journalApi.delete(id);
      toast.success('Journal entry deleted.');
      fetchEntries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete entry');
    }
  };

  const filteredEntries = entries.filter(entry =>
    entry.entryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col overflow-hidden p-6 bg-background text-foreground"
    >
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-foreground-muted mb-1">
            <Link to="/account-dashboard" className="hover:text-primary">Accounting</Link>
            <span>&gt;</span>
            <span className="text-foreground-muted font-medium">Journal Entries</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Journal Entries</h1>
        </div>

        <Link
          id="btn-new-journal"
          to="/account-dashboard/journal-entries/new"
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 px-4 py-2 rounded-theme text-sm font-semibold shadow transition-all"
        >
          <Plus className="h-4 w-4" />
          New Journal Entry
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-border mb-6">
        {['ALL', 'DRAFT', 'POSTED', 'REVERSED'].map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2.5 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${
              statusFilter === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-foreground-muted hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Advanced Filters toolbar */}
      <div className="bg-card border border-border rounded-theme p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end shadow-sm">
        {/* Search */}
        <div className="relative">
          <label className="block text-xs font-semibold text-foreground-muted mb-1.5 uppercase">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search code or text..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-theme text-sm text-foreground focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-xs font-semibold text-foreground-muted mb-1.5 uppercase">Date From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="w-full px-3 py-1.5 bg-background border border-border rounded-theme text-sm text-foreground focus:outline-none focus:border-primary"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-xs font-semibold text-foreground-muted mb-1.5 uppercase">Date To</label>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="w-full px-3 py-1.5 bg-background border border-border rounded-theme text-sm text-foreground focus:outline-none focus:border-primary"
          />
        </div>

        {/* Document Type */}
        <div>
          <label className="block text-xs font-semibold text-foreground-muted mb-1.5 uppercase">Document Type</label>
          <select
            value={docType}
            onChange={e => setDocType(e.target.value)}
            className="w-full px-3 py-1.5 bg-background border border-border rounded-theme text-sm text-foreground focus:outline-none focus:border-primary"
          >
            <option value="">All Types</option>
            <option value="MANUAL_JOURNAL">Manual Journal</option>
            <option value="SYSTEM_GENERATED">System Generated</option>
            <option value="SALES_INVOICE">Sales Invoice</option>
            <option value="PURCHASE_INVOICE">Purchase Invoice</option>
            <option value="PAYMENT">Payment</option>
            <option value="RECEIPT">Receipt</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 overflow-y-auto bg-card border border-border rounded-theme shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-background-muted text-foreground-muted border-b border-border text-xs uppercase font-semibold">
                <th className="p-3">Entry Number</th>
                <th className="p-3">Date</th>
                <th className="p-3">Type</th>
                <th className="p-3">Description</th>
                <th className="p-3 text-right">Debit</th>
                <th className="p-3 text-right">Credit</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-6 text-center text-foreground-muted">No journal entries found.</td>
                </tr>
              ) : (
                filteredEntries.map((entry, index) => {
                  const totalDebit = entry.lines?.reduce((sum, l) => sum + (l.debitAmount || 0), 0) || 0;
                  const totalCredit = entry.lines?.reduce((sum, l) => sum + (l.creditAmount || 0), 0) || 0;
                  
                  return (
                    <motion.tr
                      key={entry.journalEntryId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02, duration: 0.15 }}
                      onClick={() => navigate(`/account-dashboard/journal-entries/${entry.journalEntryId}`)}
                      className="hover:bg-background-muted/40 transition-colors cursor-pointer"
                    >
                      <td className="p-3 font-mono font-bold text-primary">{entry.entryNumber}</td>
                      <td className="p-3 flex items-center gap-1.5 text-foreground-muted">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(entry.entryDate).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-xs font-semibold uppercase">{entry.documentType?.replace('_', ' ')}</td>
                      <td className="p-3 font-semibold max-w-[200px] truncate">{entry.description}</td>
                      <td className="p-3 text-right font-mono font-medium">{totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 text-right font-mono font-medium">{totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="p-3">
                        <StatusBadge status={entry.status} />
                      </td>
                      <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <Link to={`/account-dashboard/journal-entries/${entry.journalEntryId}`} className="p-1.5 text-foreground-muted hover:text-primary hover:bg-background-muted rounded transition-colors" title="View details">
                            <Eye className="h-4 w-4" />
                          </Link>
                          
                          {entry.status === 'DRAFT' && (
                            <>
                              <Link to={`/account-dashboard/journal-entries/edit/${entry.journalEntryId}`} className="p-1.5 text-foreground-muted hover:text-primary hover:bg-background-muted rounded transition-colors" title="Edit draft">
                                <Edit2 className="h-4 w-4" />
                              </Link>
                              <button onClick={(e) => handlePost(entry.journalEntryId, e)} className="p-1.5 text-foreground-muted hover:text-success hover:bg-background-muted rounded transition-colors" title="Post entry">
                                <Play className="h-4 w-4" />
                              </button>
                              <button onClick={(e) => handleDelete(entry.journalEntryId, e)} className="p-1.5 text-foreground-muted hover:text-error hover:bg-background-muted rounded transition-colors" title="Delete draft">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}

                          {entry.status === 'POSTED' && (
                            <button onClick={(e) => handleReverse(entry.journalEntryId, e)} className="p-1.5 text-foreground-muted hover:text-error hover:bg-background-muted rounded transition-colors" title="Reverse transaction">
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
}
