import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, FileText, Printer, FileDown } from 'lucide-react';
import { inventorySubLedgerApi } from '../../api/inventorySubLedgerApi';
import { toast } from 'react-toastify';

export default function InventorySubLedgerDetailPage() {
  const { itemId } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ rows: [], closingQty: 0, closingBalance: 0 });
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchStatement();
  }, [itemId]);

  const fetchStatement = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      
      const res = await inventorySubLedgerApi.getInventoryMovement(itemId, params);
      setData(res.data?.data || { rows: [], closingQty: 0, closingBalance: 0 });
    } catch (err) {
      toast.error('Failed to load item movement ledger');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col overflow-hidden p-6 bg-background text-foreground print:p-0 print:bg-white print:text-black"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs text-foreground-muted mb-1">
            <Link to="/account-dashboard" className="hover:text-primary">Accounting</Link>
            <span>&gt;</span>
            <Link to="/account-dashboard/sub-ledger/inventory" className="hover:text-primary">Inventory Ledger</Link>
            <span>&gt;</span>
            <span className="text-foreground-muted font-medium">Movement Statement</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/account-dashboard/sub-ledger/inventory" className="p-2 hover:bg-card border border-border rounded-theme">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Item Movement Ledger</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-border rounded-theme text-sm font-semibold hover:bg-card inline-flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print Ledger
          </button>
        </div>
      </div>

      {/* Print-only Header */}
      <div className="hidden print:block mb-8 border-b border-gray-300 pb-4">
        <h1 className="text-3xl font-bold">Item Movement Ledger</h1>
        <p className="text-sm text-gray-500 mt-1">Item ID: {itemId}</p>
        <p className="text-sm text-gray-500">As of: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Filters (Hidden during print) */}
      <div className="bg-card border border-border rounded-theme p-4 mb-6 flex flex-wrap gap-4 items-center shadow-sm print:hidden">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-foreground-muted" />
          <span className="text-sm font-semibold text-foreground-muted">Period:</span>
        </div>
        <input
          type="date"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          className="px-3 py-1.5 bg-background border border-border rounded-theme text-sm focus:outline-none focus:border-primary"
        />
        <span className="text-sm text-foreground-muted">to</span>
        <input
          type="date"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          className="px-3 py-1.5 bg-background border border-border rounded-theme text-sm focus:outline-none focus:border-primary"
        />
        <button
          onClick={fetchStatement}
          className="px-4 py-1.5 bg-primary text-primary-foreground font-semibold rounded-theme text-sm hover:opacity-95 shadow-sm"
        >
          Filter
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-theme p-4">
          <p className="text-xs font-semibold text-foreground-muted uppercase">Opening Balance Value</p>
          <p className="text-xl font-bold font-mono">{(0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-card border border-border rounded-theme p-4">
          <p className="text-xs font-semibold text-foreground-muted uppercase">Closing Qty</p>
          <p className="text-xl font-bold font-mono">{data.closingQty.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-theme p-4">
          <p className="text-xs font-semibold text-foreground-muted uppercase">Closing Value</p>
          <p className="text-xl font-bold font-mono text-primary">{data.closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto bg-card border border-border rounded-theme shadow-sm print:border-none print:shadow-none">
        {loading ? (
          <div className="flex items-center justify-center h-64 print:hidden">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-background-muted z-10 print:static print:bg-transparent">
              <tr className="text-foreground-muted border-b border-border text-xs uppercase font-semibold print:text-black print:border-black">
                <th className="p-3">Date</th>
                <th className="p-3">Doc Number</th>
                <th className="p-3">Doc Type</th>
                <th className="p-3">Description / Reference</th>
                <th className="p-3 text-right">Qty In</th>
                <th className="p-3 text-right">Qty Out</th>
                <th className="p-3 text-right">Running Qty</th>
                <th className="p-3 text-right">Debit (Value)</th>
                <th className="p-3 text-right">Credit (Value)</th>
                <th className="p-3 text-right">Balance Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border print:divide-gray-300">
              {data.rows.length === 0 ? (
                <tr><td colSpan="10" className="p-6 text-center text-foreground-muted">No movement records found.</td></tr>
              ) : (
                data.rows.map((row, index) => (
                  <tr key={index} className="hover:bg-background-muted/20 transition-colors print:hover:bg-transparent">
                    <td className="p-3 font-mono text-xs">{row.entryDate}</td>
                    <td className="p-3 font-semibold text-xs">{row.entryNumber}</td>
                    <td className="p-3 text-xs">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-background-muted border border-border">
                        {row.documentType}
                      </span>
                    </td>
                    <td className="p-3 max-w-[200px] truncate text-xs" title={row.description}>
                      {row.description}
                      {row.referenceNumber && <span className="block text-[10px] text-foreground-muted">Ref: {row.referenceNumber}</span>}
                    </td>
                    <td className="p-3 text-right font-mono text-success text-xs">
                      {row.qtyIn > 0 ? `+${row.qtyIn}` : '-'}
                    </td>
                    <td className="p-3 text-right font-mono text-error text-xs">
                      {row.qtyOut > 0 ? `-${row.qtyOut}` : '-'}
                    </td>
                    <td className="p-3 text-right font-mono font-semibold text-xs">
                      {row.runningQty.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono text-xs">
                      {row.debitAmount > 0 ? row.debitAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="p-3 text-right font-mono text-xs">
                      {row.creditAmount > 0 ? row.creditAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-xs">
                      {row.runningBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
}
