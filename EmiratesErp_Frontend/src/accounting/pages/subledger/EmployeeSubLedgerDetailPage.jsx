import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Filter } from 'lucide-react';
import { subLedgerApi } from '../../api/subLedgerApi';
import { toast } from 'react-toastify';

export default function EmployeeSubLedgerDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Date filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      
      const res = await subLedgerApi.getEmployeeStatement(id, params);
      setData(res.data?.data || null);
    } catch (err) {
      toast.error('Failed to load Employee statement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col overflow-hidden p-6 bg-background text-foreground"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-foreground-muted mb-1">
            <Link to="/account-dashboard/sub-ledger/employee" className="hover:text-primary flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Back to Employee List
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Employee Statement: {data?.partyName || 'Loading...'}
          </h1>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-theme p-4">
          <p className="text-xs font-semibold text-foreground-muted uppercase">Employee ID</p>
          <p className="text-lg font-bold">{data?.partyId || '-'}</p>
        </div>
        <div className="bg-card border border-border rounded-theme p-4">
          <p className="text-xs font-semibold text-foreground-muted uppercase">Name</p>
          <p className="text-lg font-bold">{data?.partyName || '-'}</p>
        </div>
        <div className="bg-card border border-border rounded-theme p-4">
          <p className="text-xs font-semibold text-foreground-muted uppercase">Opening Balance</p>
          <p className="text-lg font-bold">{data?.openingBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</p>
        </div>
        <div className="bg-card border border-border rounded-theme p-4">
          <p className="text-xs font-semibold text-foreground-muted uppercase">Closing Balance</p>
          <p className="text-lg font-bold">{data?.closingBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</p>
        </div>
      </div>

      {/* Date Filters */}
      <div className="bg-card border border-border rounded-theme p-4 mb-6 flex flex-wrap gap-4 items-end shadow-sm">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold text-foreground-muted mb-1 uppercase tracking-wider">From Date</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold text-foreground-muted mb-1 uppercase tracking-wider">To Date</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-background border border-border hover:bg-background-muted text-foreground rounded-theme font-medium flex items-center gap-2 transition-colors"
        >
          <Filter className="h-4 w-4" /> Filter
        </button>
      </div>

      {/* Transactions Table */}
      <div className="flex-1 overflow-y-auto bg-card border border-border rounded-theme shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-background-muted z-10">
              <tr className="text-foreground-muted border-b border-border text-xs uppercase font-semibold">
                <th className="p-3">Date</th>
                <th className="p-3">Entry No</th>
                <th className="p-3">Doc Type</th>
                <th className="p-3">Reference</th>
                <th className="p-3">Description</th>
                <th className="p-3 text-right">Debit</th>
                <th className="p-3 text-right">Credit</th>
                <th className="p-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(!data?.rows || data.rows.length === 0) ? (
                <tr><td colSpan="8" className="p-6 text-center text-foreground-muted">No transactions found for this period.</td></tr>
              ) : (
                data.rows.map((row, index) => (
                  <motion.tr
                    key={row.journalEntryId || index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.01, duration: 0.15 }}
                    className="hover:bg-background-muted/40 transition-colors"
                  >
                    <td className="p-3 whitespace-nowrap">{row.entryDate}</td>
                    <td className="p-3 font-mono text-xs">
                      <Link to={`/account-dashboard/journal-entries/${row.journalEntryId}`} className="text-primary hover:underline">
                        {row.entryNumber}
                      </Link>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-background-muted rounded text-xs font-medium border border-border">
                        {row.documentType}
                      </span>
                    </td>
                    <td className="p-3">{row.referenceNumber || '-'}</td>
                    <td className="p-3">{row.description || '-'}</td>
                    <td className="p-3 text-right font-mono">
                      {row.debitAmount ? row.debitAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {row.creditAmount ? row.creditAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className={`p-3 text-right font-mono font-bold ${row.runningBalance > 0 ? 'text-error' : row.runningBalance < 0 ? 'text-success' : ''}`}>
                      {Math.abs(row.runningBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })} {row.runningBalance >= 0 ? 'Cr' : 'Dr'}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
}
