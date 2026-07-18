import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Printer, Calendar, ArrowLeft } from 'lucide-react';
import { subLedgerApi } from '../../api/subLedgerApi';
import { toast } from 'react-toastify';

export default function ApSubLedgerDetailPage() {
  const { supplierId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchStatement();
  }, [supplierId, dateFrom, dateTo]);

  const fetchStatement = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      
      const res = await subLedgerApi.getApStatement(supplierId, params);
      setData(res.data?.data);
    } catch (err) {
      toast.error('Failed to load statement');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading && !data) {
    return <div className="p-6 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!data) return <div className="p-6">No data found.</div>;

  const totalBilled = data.rows?.reduce((sum, r) => sum + r.creditAmount, 0) || 0;
  const totalPaid = data.rows?.reduce((sum, r) => sum + r.debitAmount, 0) || 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col overflow-hidden p-6 bg-background text-foreground"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-4">
          <Link to="/account-dashboard/sub-ledger/ap" className="p-2 bg-background-muted rounded-full hover:bg-border transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Supplier Account Statement</h1>
            <p className="text-foreground-muted">{data.partyName}</p>
          </div>
        </div>
        <button onClick={handlePrint} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-theme text-sm font-semibold shadow hover:opacity-90 transition-all">
          <Printer className="h-4 w-4" /> Print
        </button>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-bold mb-2">Statement of Account</h1>
        <p className="text-xl">{data.partyName}</p>
        <p className="text-sm text-foreground-muted">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-theme p-4">
          <p className="text-xs font-semibold text-foreground-muted uppercase">Opening Balance</p>
          <p className="text-xl font-bold mt-1">{data.openingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-card border border-border rounded-theme p-4">
          <p className="text-xs font-semibold text-foreground-muted uppercase">Total Billed (Cr)</p>
          <p className="text-xl font-bold mt-1 text-error">{totalBilled.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-card border border-border rounded-theme p-4">
          <p className="text-xs font-semibold text-foreground-muted uppercase">Total Paid (Dr)</p>
          <p className="text-xl font-bold mt-1 text-success">{totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-card border border-border rounded-theme p-4">
          <p className="text-xs font-semibold text-foreground-muted uppercase">Closing Balance</p>
          <p className="text-xl font-bold mt-1">{data.closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Filters (Hidden in print) */}
      <div className="flex gap-4 mb-6 print:hidden">
        <div>
          <label className="block text-xs font-semibold text-foreground-muted mb-1">Date From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-background border border-border rounded-theme px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground-muted mb-1">Date To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-background border border-border rounded-theme px-3 py-1.5 text-sm" />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto bg-card border border-border rounded-theme print:border-none print:shadow-none shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 bg-background-muted print:bg-transparent">
            <tr className="text-foreground-muted border-b border-border text-xs uppercase font-semibold">
              <th className="p-3">Date</th>
              <th className="p-3">Entry No</th>
              <th className="p-3">Reference</th>
              <th className="p-3">Type</th>
              <th className="p-3">Description</th>
              <th className="p-3">Due Date</th>
              <th className="p-3 text-right">Payment (Dr)</th>
              <th className="p-3 text-right">Bill (Cr)</th>
              <th className="p-3 text-right">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(!data.rows || data.rows.length === 0) ? (
              <tr><td colSpan="8" className="p-6 text-center text-foreground-muted">No transactions in this period.</td></tr>
            ) : (
              data.rows.map((row, i) => (
                <tr key={i} className={`hover:bg-background-muted/40 transition-colors ${row.isOpeningBalance ? 'bg-muted font-bold italic text-foreground-muted' : ''}`}>
                  <td className="p-3 flex items-center gap-1.5 text-foreground-muted">
                    {row.entryDate && <Calendar className="h-3.5 w-3.5" />}
                    {row.entryDate ? new Date(row.entryDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="p-3">
                    {row.journalEntryId ? (
                      <Link to={`/account-dashboard/journal-entries/${row.journalEntryId}`} className="text-primary hover:underline font-mono font-medium">
                        {row.entryNumber}
                      </Link>
                    ) : '-'}
                  </td>
                  <td className="p-3 font-medium">{row.referenceNumber || '-'}</td>
                  <td className="p-3 text-xs font-semibold uppercase">{row.documentType?.replace('_', ' ')}</td>
                  <td className="p-3 max-w-[200px] truncate" title={row.description}>{row.description}</td>
                  <td className="p-3">
                    {row.dueDate ? (
                      <div>
                        <div>{new Date(row.dueDate).toLocaleDateString()}</div>
                        {row.creditAmount > row.debitAmount && new Date(row.dueDate) < new Date() && (
                           <span className="text-[10px] font-bold text-error bg-error/10 px-1.5 py-0.5 rounded uppercase">Overdue</span>
                        )}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="p-3 text-right font-mono text-success">{row.debitAmount > 0 ? row.debitAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                  <td className="p-3 text-right font-mono text-error">{row.creditAmount > 0 ? row.creditAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                  <td className="p-3 text-right font-mono font-bold">{row.runningBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
